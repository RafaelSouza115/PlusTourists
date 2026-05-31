package com.plustourists.service;

import com.plustourists.model.ListaDeDados;
import com.plustourists.reader.LeituraExcelEventos;
import com.plustourists.reader.LeituraExcelTuristas;

import java.io.InputStream;
import java.util.List;

public class ExcelService {

    private final LeituraExcelEventos leituraEventos;
    private final LeituraExcelTuristas leituraTuristas;

    public ExcelService() {
        this.leituraEventos = new LeituraExcelEventos();
        this.leituraTuristas = new LeituraExcelTuristas();
    }

    public List<ListaDeDados> lerEventos(InputStream arquivoExcel) {
        try {
            return leituraEventos.extrairRegistroEvento(arquivoExcel);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler Excel de eventos: " + e.getMessage(), e);
        }
    }

    public List<ListaDeDados> lerTuristas(InputStream arquivoExcel) {
        try {
            return leituraTuristas.extrairRegistroTuristas(arquivoExcel);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler Excel de turistas: " + e.getMessage(), e);
        }
    }
}