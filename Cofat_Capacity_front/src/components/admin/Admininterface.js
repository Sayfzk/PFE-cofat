import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { Table, Space, Input, Button, Layout, message, Select, Popconfirm } from "antd";
import { SearchOutlined, ImportOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;
const { Option } = Select;

const DashboardTable = () => {
  // États pour les données
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchShift, setSearchShift] = useState("");
  const [searchLigne, setSearchLigne] = useState("");
  const [searchRefCab, setSearchRefCab] = useState("");
  const [searchZone, setSearchZone] = useState("");
  const [newTableData, setNewTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false); // Nouvelle variable d'état

  // Configuration de la sélection multiple
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => {
      setSelectedRows(selectedRowKeys);
    },
  };

  // Format ID_Shift to Day (YYYY-MM-DD)
  const formatIdShiftToDay = (idShift) => {
    if (!idShift || idShift.length < 9) return "";

    // Remove the last digit and format as YYYY-MM-DD
    const idShiftWithoutLast = idShift.slice(0, -1);

    if (idShiftWithoutLast.length >= 8) {
      const year = idShiftWithoutLast.slice(0, 4);
      const month = idShiftWithoutLast.slice(4, 6);
      const day = idShiftWithoutLast.slice(6, 8);
      return `${year}-${month}-${day}`;
    }

    return "";
  };

  // Fonction pour importer une seule ligne
  const handleImport = (record) => {
    setNewTableData((prevData) => [
      ...prevData,
      {
        ...record,
        id: `imported-${Date.now()}-${prevData.length}`,
        qte_emballage: "",
        arret_numerique: "",
        courbe_de_demarage: "",
        arret_remarque: "",
        jour: formatIdShiftToDay(record.id_shift),
      },
    ]);
  };

  // Fonction pour importer toutes les lignes sélectionnées
  const handleImportSelected = () => {
    const selectedData = filteredData.filter(item =>
      selectedRows.includes(item.key)
    );

    const newData = selectedData.map(record => ({
      ...record,
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      qte_emballage: "",
      arret_numerique: "",
      courbe_de_demarage: "",
      arret_remarque: "",
      jour: formatIdShiftToDay(record.id_shift),
    }));

    setNewTableData(prevData => [...prevData, ...newData]);
    setSelectedRows([]); // Réinitialiser la sélection
  };

  // Ajouter une nouvelle ligne manuellement
  const handleAddRow = () => {
    setNewTableData((prevData) => [
      ...prevData,
      {
        id: `new-${Date.now()}`,
        ligne: "",
        zone: "",
        qte: "",
        ref_cab: "",
        effectif: "",
        poste: "",
        id_shift: "",
        qte_emballage: "",
        arret_numerique: "",
        courbe_de_demarage: "",
        arret_remarque: "",
        jour: "",
      },
    ]);
  };

  // Supprimer une ligne du tableau secondaire
  const handleDeleteRow = (id) => {
    setNewTableData((prevData) => prevData.filter((row) => row.id !== id));
  };

  // Classe pour gérer les erreurs personnalisées
  class ValidationError extends Error {
    constructor(message, details = {}) {
      super(message);
      this.name = "ValidationError";
      this.details = details;
    }
  }

  // Fonction de validation détaillée des données
  const validateDataBeforeSave = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new ValidationError("Aucune donnée à sauvegarder");
    }

    const isValidDate = (dateString) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString).getTime());
    };

    const errors = data.map((item, index) => {
      const fieldErrors = [];
      if (!item.ligne?.trim()) fieldErrors.push("Ligne");
      if (!item.qte || isNaN(parseInt(item.qte))) fieldErrors.push("Quantité");
      if (!item.ref_cab?.trim()) fieldErrors.push("Référence Cab");
      if (item.jour && !isValidDate(item.jour.trim())) fieldErrors.push("Jour (format invalide)");

      return fieldErrors.length > 0 ? { index: index + 1, fields: fieldErrors } : null;
    }).filter(Boolean);

    if (errors.length > 0) {
      throw new ValidationError("Erreur de validation des données", { errors });
    }
  };

  // Fonction pour récupérer les données - wrapped with useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchShift) params.append("ID_Shift", searchShift);
      if (searchLigne) params.append("Ligne", searchLigne);
      if (searchRefCab) params.append("RefCab", searchRefCab);
      if (searchZone) params.append("Zone", searchZone);

      const url = `http://172.23.23.31:9001/api/get-data${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Requête envoyée à :", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors de la récupération des données");

      const result = await response.json();
      if (!result.length && searchInitiated) {
        message.info("Aucune donnée trouvée pour ces critères.");
        setFilteredData([]);
        return;
      }

      const transformedData = result.map((item, index) => ({
        key: index,
        ligne: item.Ligne || "",
        zone: item.Zone || "N/A",
        qte: item.Qte || 0,
        ref_cab: item.RefCab || "",
        effectif: item.Effectif || 0,
        poste: item.Poste || (item.ID_Shift ? parseInt(item.ID_Shift.toString().slice(-1), 10) : ""),
        id_shift: item.ID_Shift || searchShift || "",
      }));

      setData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      if (searchInitiated) message.error("Impossible de récupérer les données.");
    } finally {
      setLoading(false);
    }
  }, [searchShift, searchLigne, searchRefCab, searchZone, searchInitiated]);

  const handleSave = async () => {
    try {
      validateDataBeforeSave(newTableData);

      const formattedData = newTableData.map(({
        ligne, zone, qte, ref_cab, effectif, poste, id_shift, qte_emballage, arret_numerique, jour, courbe_de_demarage, arret_remarque
      }) => ({
        Jour: jour?.trim() || new Date().toISOString().split('T')[0],
        Ligne: ligne.trim(),
        Poste: poste?.trim() || null,
        RefCab: ref_cab.trim(), // Changed to match backend expectation
        Quantite: parseInt(qte, 10) || null,
        QTE_Emballage: parseInt(qte_emballage, 10) || null,
        Effectif: parseInt(effectif, 10) || null,
        Arret_numerique: parseInt(arret_numerique, 10) || null,
        Courbe_demarage: courbe_de_demarage?.trim() || null, // Removed extra "_de_"
        Arret_remarque: arret_remarque?.trim() || null,
        Zone: zone?.trim() || null,
        ID_Shift: parseInt(id_shift, 10) || null
      }));

      console.log("Données à envoyer:", formattedData);

      const response = await fetch("http://172.23.23.31:9001/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur côté serveur : ${errorData.message || "Erreur inconnue"} - ${errorData.details || ""}`);
      }

      message.success("Données sauvegardées avec succès !");
      setNewTableData([]);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Erreur de validation :", error.details);
        message.error(
          `Validation échouée :\n${error.details.errors.map(e => `Ligne ${e.index} : ${e.fields.join(", ")}`).join("\n")}`
        );
      } else {
        console.error("Erreur lors de la sauvegarde :", error);
        message.error(`Erreur : ${error.message}`);
      }
    }
  };



  // Mettre à jour une cellule dans le tableauu éditable
  const updateEditableData = (rowId, columnId, value) => {
    setNewTableData(old =>
      old.map(row => {
        if (row.id === rowId) {
          // Si le champ mis à jour est id_shift, mettre à jour automatiquement le champ jour
          if (columnId === 'id_shift') {
            return {
              ...row,
              [columnId]: value,
              jour: formatIdShiftToDay(value)
            };
          }
          return {
            ...row,
            [columnId]: value
          };
        }
        return row;
      })
    );
  };

  // Composant pour les cellules éditables
  const EditableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);

    // Mettre à jour l'état local quand la valeur initiale change
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    // Mettre à jour les données quand l'utilisateur quitte le champ
    const onBlur = () => {
      updateEditableData(row.original.id, column.id, value);
    };

    return (
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        style={{ width: '100%' }}
      />
    );
  };

  // Définir les colonnes pour le tableau éditable avec React Table
  const editableColumns = useMemo(
    () => [
      {
        accessorKey: 'ligne',
        header: 'Ligne',
        cell: EditableCell,
      },
      {
        accessorKey: 'zone',
        header: 'Zone',
        cell: EditableCell,
      },
      {
        accessorKey: 'qte',
        header: 'Quantité',
        cell: EditableCell,
      },
      {
        accessorKey: 'ref_cab',
        header: 'Ref Cab',
        cell: EditableCell,
      },
      {
        accessorKey: 'effectif',
        header: 'Effectif',
        cell: EditableCell,
      },
      {
        accessorKey: 'poste',
        header: 'Poste',
        cell: EditableCell,
      },
      {
        accessorKey: 'id_shift',
        header: 'ID Shift',
        cell: EditableCell,
      },
      {
        accessorKey: 'qte_emballage',
        header: 'QTE Emballage',
        cell: EditableCell,
      },
      {
        accessorKey: 'arret_numerique',
        header: 'Arrêt numérique',
        cell: EditableCell,
      },
      {
        accessorKey: 'jour',
        header: 'Jour',
        cell: EditableCell,
      },
      {
        accessorKey: 'courbe_de_demarage',
        header: 'Courbe de démarrage',
        cell: EditableCell,
      },
      {
        accessorKey: 'arret_remarque',
        header: 'Arrêt remarque',
        cell: EditableCell,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette ligne ?"
            onConfirm={() => handleDeleteRow(row.original.id)}
            okText="Oui"
            cancelText="Non"
          >
            <DeleteOutlined
              style={{
                fontSize: '18px',
                color: '#ff4d4f',
                cursor: 'pointer'
              }}
            />
          </Popconfirm>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  // Initialiser le tableau React pour le tableau éditable
  const table = useReactTable({
    data: newTableData,
    columns: editableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  // Effectuer la recherche - mise à jour pour définir searchInitiated
  const handleSearch = () => {
    setSearchInitiated(true); // Marquer que l'utilisateur a explicitement lancé une recherche
    setLoading(true);
    fetchData();
  };

  // Charger les données initiales - modifier pour ne pas lancer de recherche automatique
  useEffect(() => {
    // On ne lance plus de recherche automatique à chaque frappe
    // La recherche est déclenchée uniquement sur le bouton Rechercher 
    // MAIS on peut toujours conserver ce code pour une recherche initiale si nécessaire
    if (searchInitiated && searchShift) {
      fetchData();
    }
  }, [fetchData, searchInitiated]); // Retirer searchShift des dépendances

  // Styles des boutons
  const buttonStyle = {
    transition: 'all 0.3s',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    color: 'white',
  };

  const importButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#52c41a',
    borderColor: '#52c41a',
    color: 'white',
  };

  // Colonnes du tableau principal avec style amélioré
  const columns = [
    {
      title: "Ligne",
      dataIndex: "ligne",
      key: "ligne",
      sorter: (a, b) => a.ligne.localeCompare(b.ligne),
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
      sorter: (a, b) => a.zone.localeCompare(b.zone),
    },
    {
      title: "Quantité",
      dataIndex: "qte",
      key: "qte",
      sorter: (a, b) => a.qte - b.qte,
    },
    {
      title: "Ref Cab",
      dataIndex: "ref_cab",
      key: "ref_cab",
      sorter: (a, b) => a.ref_cab.localeCompare(b.ref_cab),
    },
    {
      title: "Effectif",
      dataIndex: "effectif",
      key: "effectif",
      sorter: (a, b) => a.effectif - b.effectif,
    },
    {
      title: "Poste",
      dataIndex: "poste",
      key: "poste",
      sorter: (a, b) => String(a.poste).localeCompare(String(b.poste)),
    },
    {
      title: "ID Shift",
      dataIndex: "id_shift",
      key: "id_shift",
      sorter: (a, b) => String(a.id_shift).localeCompare(String(b.id_shift)),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <ImportOutlined
          onClick={() => handleImport(record)}
          style={{
            fontSize: '20px',
            color: '#52c41a',
            cursor: 'pointer',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#389e0d'}
          onMouseOut={(e) => e.currentTarget.style.color = '#52c41a'}
        />
      ),
    },
  ];

  return (
    <Layout style={{ height: "100vh", background: "#f0f2f5" }}>
      <Header
        style={{
          background: "#001529",
          color: "#fff",
          fontSize: "20px",
          fontWeight: "bold",
          textAlign: "center",
          padding: "10px 20px",
        }}
      >
        Dashboard Table
      </Header>

      <Content style={{ padding: "20px", overflow: "auto" }}>
        {/* Barre de recherche */}
        <Space
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <Input
            placeholder="Rechercher par ID_Shift"
            prefix={<SearchOutlined />}
            value={searchShift}
            onChange={(e) => setSearchShift(e.target.value)}
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Rechercher par Ligne"
            prefix={<SearchOutlined />}
            value={searchLigne}
            onChange={(e) => setSearchLigne(e.target.value)}
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Rechercher par Ref Cab"
            prefix={<SearchOutlined />}
            value={searchRefCab}
            onChange={(e) => setSearchRefCab(e.target.value)}
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Rechercher par Zone"
            prefix={<SearchOutlined />}
            value={searchZone}
            onChange={(e) => setSearchZone(e.target.value)}
            style={{ width: "200px" }}
          />
          <Button
            type="primary"
            onClick={handleSearch}
            style={primaryButtonStyle}
            loading={loading}
          >
            Rechercher
          </Button>
        </Space>

        {/* Premier tableau (données de recherche) */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          bordered
          style={{ background: "#fff" }}
          loading={loading}
        />

        {/* Boutons pour le deuxième tableau */}
        <Space style={{ marginTop: "16px", marginBottom: "16px" }}>
          <Button
            type="primary"
            onClick={handleAddRow}
            style={primaryButtonStyle}
            icon={<PlusOutlined />}
          >
            Ajouter une ligne
          </Button>
          <Button
            type="primary"
            onClick={handleImportSelected}
            disabled={selectedRows.length === 0}
            style={importButtonStyle}
            icon={<ImportOutlined />}
          >
            Importer la sélection ({selectedRows.length})
          </Button>
        </Space>

        {/* Deuxième tableau avec TanStack Table */}
        <div className="react-table-container" style={{ marginTop: "20px", background: "#fff", padding: "16px", borderRadius: "2px" }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        background: '#fafafa',
                        padding: '12px 8px',
                        borderBottom: '1px solid #f0f0f0',
                        fontWeight: 500,
                        textAlign: 'left',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {
                        { asc: ' 🔼', desc: ' 🔽' }
                        [header.column.getIsSorted()] ?? null
                      }
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '8px' }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
            <div>
              <span>
                Page{' '}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <Space style={{ marginTop: "16px" }}>
          <Button
            type="primary"
            onClick={handleSave}
            style={primaryButtonStyle}
            icon={<SaveOutlined />}
            disabled={newTableData.length === 0}
          >
            Enregistrer les données
          </Button>
        </Space>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#001529",
          color: "#fff",
          padding: "10px 20px",
        }}
      >
        ©2024 Created by Said Bouchouicha | All Rights Reserved
      </Footer>
    </Layout>
  );
};

export default DashboardTable;